import {
  Mjml,
  MjmlBody,
  MjmlButton,
  MjmlColumn,
  MjmlImage,
  MjmlSection,
  MjmlText,
  MjmlWrapper,
} from "mjml-react";

export default function WelcomeEmail({ url }: { url: string }): JSX.Element {
  return (
    <Mjml>
      <MjmlBody width={500}>
        <MjmlWrapper>
          <MjmlSection>
            <MjmlColumn>
              <MjmlImage
                padding="12px 0 24px"
                width="70px"
                height="70px"
                align="center"
                src="https://husks.org/apple-touch-icon.png"
              />
              <MjmlText fontWeight={800} fontSize={20} align="center">
                Welcome to HusksChat!
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
          <MjmlSection>
            <MjmlColumn>
              <MjmlText>
                Hey there, thanks for signing up for HusksChat. We're excited to
                have you on board. To get started, click the button below to
                access your chats with OpenAI.
              </MjmlText>
              <>
                <MjmlButton
                  href={url}
                  width="100%"
                  fontWeight={800}
                  fontSize={16}
                  align="left"
                  backgroundColor="#B5FFD9"
                  color="#415C4E"
                >
                  Dashboard
                </MjmlButton>
              </>
              <MjmlText>
                {`If you're on a mobile device, you can also copy the link below
                      and paste it into the browser of your choice.`}
              </MjmlText>
              <MjmlText>
                <a
                  rel="nofollow"
                  style={{
                    textDecoration: "none",
                    color: `#847F7D !important`,
                  }}
                >
                  {url.replace(/^https?:\/\//, "")}
                </a>
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
        </MjmlWrapper>
      </MjmlBody>
    </Mjml>
  );
}
