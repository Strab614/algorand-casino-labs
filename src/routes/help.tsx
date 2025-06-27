import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Divider, Link, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Help = () => {
  return (
    <Container sx={{ my: 2, pb: 2 }} maxWidth="md">
      <Typography variant="h4" color="text.primary" sx={{ pb: 2 }}>
        Help
      </Typography>
      <Typography variant="body1" color="text.primary" sx={{ pb: 2 }}>
        If you have any urgent, time critical issues or need any assistance please join our discord server and create a support ticket.{" "}
        <Link href="https://discord.gg/RRVA5p3U6p">Discord</Link>
      </Typography>
      <Typography>
        Alternatively please contact us via email <a href="mailto:admin@algo-poker.com">admin@algo-poker.com</a>
      </Typography>

      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" color="text.primary" sx={{ pb: 1 }}>
          Frequently Asked Questions
        </Typography>
        <Box>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>How long will my casino refund request take?</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Typography variant="subtitle1">
                After you have succesfully submitted a claim we aim to process and send any casino refunds due within 48 hours. Please do
                not contact earlier than this window. We apologise for any inconvenience caused.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>When will house staking profits be paid out to stakers?</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Typography variant="subtitle1">
                There is no set time for rewards to be paid out to house stakers if the previous period was profitable. Generally this will
                be completed shortly after 10:00 GMT time, but it can take longer.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>When will leaderboard rewards be paid out to users?</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Typography variant="subtitle1">
                There is no set time for rewards to be paid out for the leaderboard incentives. Generally this will be completed shortly
                after 10:00 GMT time, with results published shortly after.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Typography variant="h6" color="text.primary" sx={{ py: 1 }}>
          Lottery
        </Typography>
        <Box>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>How are the drawn numbers chosen?</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Typography variant="subtitle1">
                When the lottery is created, it commits to a future round greater than the end of the lottery. The Randomness Beacon is then
                called and the random data is used to generate a set of 5 unique winning numbers. This ensures the result cannot be
                predicted as it it not known in the future.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>What happens if something goes wrong?</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Typography variant="subtitle1">
                If the lottery never gets drawn due to unknown issues, or the randomness oracle never being called within the given
                timescale users will be able to claim a full refund of their ticket costs. This option will appear when a refund is
                available.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>How will I know if I've won and when will I get paid?</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Typography variant="subtitle1">
                The entire logs of the application are visible in the overview page, as every action is on-chain you can validate this by
                inspecting each transaction. Once the lottery is drawn, winners will be calculated and rewards will be sent (there is no
                need for you to interact). Ensure you are opted into the prize asset or you will not receive your rewards.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>What happens if nobody wins?</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
              <Typography variant="subtitle1">
                If nobody wins the lottery the prize pool will rollover to the next lottery increasing the potential jackpot and prize pool.
                If fees are enabled, the manager will retain the fees.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Container>
  );
};

export default Help;
