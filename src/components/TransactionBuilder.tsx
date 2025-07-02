import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useWallet } from '@txnlab/use-wallet-react';
import {
  useCreatePayment,
  useCreateAssetTransfer,
  useSubmitTransaction,
  useAddressValidation,
} from '@/hooks/useAlgorand';
import { useNotification } from '@/hooks/useNotification';
import { enhancedAlgorandClient } from '@/api/algorand/enhanced';

type TransactionType = 'payment' | 'asset-transfer';

interface TransactionBuilderProps {
  onTransactionComplete?: (txId: string) => void;
}

export const TransactionBuilder: React.FC<TransactionBuilderProps> = ({
  onTransactionComplete,
}) => {
  const { activeAddress, signTransactions } = useWallet();
  const notification = useNotification();
  const { validate } = useAddressValidation();
  
  const [txType, setTxType] = useState<TransactionType>('payment');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [assetId, setAssetId] = useState('');
  const [note, setNote] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  const createPayment = useCreatePayment();
  const createAssetTransfer = useCreateAssetTransfer();
  const submitTransaction = useSubmitTransaction();

  const validateForm = () => {
    if (!activeAddress) {
      notification.display({ type: 'error', message: 'Wallet not connected' });
      return false;
    }

    const recipientValidation = validate(recipient);
    if (!recipientValidation.isValid) {
      notification.display({ type: 'error', message: recipientValidation.error! });
      return false;
    }

    if (!amount || Number(amount) <= 0) {
      notification.display({ type: 'error', message: 'Invalid amount' });
      return false;
    }

    if (txType === 'asset-transfer' && (!assetId || Number(assetId) <= 0)) {
      notification.display({ type: 'error', message: 'Invalid asset ID' });
      return false;
    }

    return true;
  };

  const handleBuildAndSubmit = async () => {
    if (!validateForm()) return;

    setIsBuilding(true);

    try {
      let transaction;

      if (txType === 'payment') {
        const amountInMicroAlgos = enhancedAlgorandClient.convertToMicroAlgos(Number(amount));
        transaction = await createPayment.mutateAsync({
          from: activeAddress!,
          to: recipient,
          amount: amountInMicroAlgos,
          note,
        });
      } else {
        transaction = await createAssetTransfer.mutateAsync({
          from: activeAddress!,
          to: recipient,
          assetId: Number(assetId),
          amount: Number(amount),
          note,
        });
      }

      // Sign the transaction
      const encodedTxn = transaction.toByte();
      const signedTxns = await signTransactions([encodedTxn]);
      
      // Submit the transaction
      const txId = await submitTransaction.mutateAsync(signedTxns[0]);
      
      notification.display({
        type: 'success',
        message: `Transaction submitted successfully: ${txId.slice(0, 8)}...`,
      });

      // Reset form
      setRecipient('');
      setAmount('');
      setAssetId('');
      setNote('');

      onTransactionComplete?.(txId);
    } catch (error) {
      notification.display({
        type: 'error',
        message: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsBuilding(false);
    }
  };

  if (!activeAddress) {
    return (
      <Alert severity="warning">
        Please connect your wallet to use the transaction builder.
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Transaction Builder"
        subheader="Build and submit Algorand transactions"
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={txType}
              label="Transaction Type"
              onChange={(e) => setTxType(e.target.value as TransactionType)}
            >
              <MenuItem value="payment">ALGO Payment</MenuItem>
              <MenuItem value="asset-transfer">Asset Transfer</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            error={recipient !== '' && !validate(recipient).isValid}
            helperText={
              recipient !== '' && !validate(recipient).isValid
                ? validate(recipient).error
                : ''
            }
          />

          <TextField
            fullWidth
            label={txType === 'payment' ? 'Amount (ALGO)' : 'Amount'}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0, step: txType === 'payment' ? 0.000001 : 1 }}
          />

          {txType === 'asset-transfer' && (
            <TextField
              fullWidth
              label="Asset ID"
              type="number"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              inputProps={{ min: 1 }}
            />
          )}

          <TextField
            fullWidth
            label="Note (Optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={2}
            inputProps={{ maxLength: 1000 }}
          />

          <Divider />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleBuildAndSubmit}
              disabled={isBuilding || !recipient || !amount}
              startIcon={isBuilding ? <CircularProgress size={20} /> : null}
              fullWidth
            >
              {isBuilding ? 'Building & Submitting...' : 'Build & Submit Transaction'}
            </Button>
          </Box>

          {(createPayment.error || createAssetTransfer.error || submitTransaction.error) && (
            <Alert severity="error">
              {createPayment.error?.message ||
                createAssetTransfer.error?.message ||
                submitTransaction.error?.message}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionBuilder;