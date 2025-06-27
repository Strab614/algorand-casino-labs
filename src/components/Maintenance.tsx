import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material";
import AsaIcon from "./AsaIcon";

interface MaintenanceProps {
  message: string;
}

const Maintenance = ({ message }: MaintenanceProps) => {
  return (
    <Card>
      <CardHeader
        title={
          <div style={{ display: "flex" }}>
            <Typography variant="h6" color="text.primary">
              Maintenance mode
            </Typography>
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                paddingLeft: 2,
              }}
            >
              <AsaIcon asaId={388592191} />
            </div>
          </div>
        }
        sx={{
          backgroundColor: "#272727",
        }}
      />
      <Divider />
      <CardContent>
        <Typography variant="body1">{message}</Typography>
      </CardContent>
    </Card>
  );
};

export default Maintenance;
