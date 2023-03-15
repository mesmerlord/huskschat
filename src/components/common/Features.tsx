import {
  createStyles,
  Title,
  SimpleGrid,
  Text,
  ThemeIcon,
  Grid,
  Col,
  rem,
  MediaQuery,
  Box,
  Container,
  Card,
  Center,
} from "@mantine/core";
import {
  IconReceiptOff,
  IconFlame,
  IconCircleDotted,
  IconSpyOff,
  IconCornerRightDownDouble,
} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: `calc(${theme.spacing.md} * 2) ${theme.spacing.md}`,
    [theme.fn.smallerThan("md")]: {
      padding: 2,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: rem(36),
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },
}));

const features = [
  {
    icon: IconSpyOff,
    title: "Privacy Focused",
    description: "No login, no ads, no hidden gotchas",
  },
  {
    icon: IconReceiptOff,
    title: "No Fees",
    description: "No $20/month ChatGPT subscription",
  },
  {
    icon: IconFlame,

    title: "Faster Response",
    description:
      "No bottleneck from other users, you get a response as soon as OpenAI is done",
  },
  {
    icon: IconCircleDotted,
    title: "Run Locally",
    description:
      "Add your own OpenAI API key, and all requests go directly to OpenAI",
  },
];

export function FeaturesTitle() {
  const { classes } = useStyles();

  const items = features.map((feature) => (
    <Card
      sx={(theme) => ({
        [theme.fn.smallerThan("md")]: {
          padding: "0.3rem",
        },
      })}
    >
      <div key={feature.title}>
        <ThemeIcon
          size={44}
          radius="md"
          variant="gradient"
          gradient={{ deg: 133, from: "blue", to: "cyan" }}
        >
          <feature.icon size={rem(26)} stroke={1.5} />
        </ThemeIcon>
        <Text fz="md" mt="sm" fw={500}>
          {feature.title}
        </Text>
        <Text c="dimmed" fz="sm">
          {feature.description}
        </Text>
      </div>
    </Card>
  ));

  return (
    <div className={classes.wrapper}>
      <Grid gutter={30}>
        <Col span={12} md={12}></Col>

        <Col
          span={12}
          md={12}
          sx={(theme) => ({
            [theme.fn.smallerThan("md")]: { padding: 2 },
          })}
        >
          <Container size="sm">
            <SimpleGrid
              cols={2}
              spacing={20}
              breakpoints={[
                { maxWidth: "md", cols: 2, spacing: 10, verticalSpacing: "xs" },
              ]}
              sx={(theme) => ({
                [theme.fn.smallerThan("md")]: { padding: 2 },
              })}
            >
              {items}
            </SimpleGrid>
          </Container>
        </Col>
      </Grid>
      <Box sx={{ marginTop: "20px" }}>
        <Title order={6} align="center">
          ...and much more
        </Title>
        <Title order={6} align="center">
          Type a message to get started
        </Title>
        <Center
          sx={(theme) => ({
            [theme.fn.smallerThan("md")]: { marginBottom: -20 },
          })}
        >
          <IconCornerRightDownDouble />
        </Center>
      </Box>
    </div>
  );
}
