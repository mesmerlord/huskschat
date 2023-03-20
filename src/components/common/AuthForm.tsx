import { getEmailProvider } from "@/components/core/utils/mail";
import {
  Box,
  Button,
  Card,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { signIn, getProviders } from "next-auth/react";
import { useState } from "react";
import { useMutation } from "react-query";
import Link from "next/link";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const {
    mutate: login,
    isLoading,
    isSuccess,
  } = useMutation("login", () =>
    signIn("email", { email, redirect: false, callbackUrl: "/" })
  );

  if (isSuccess) {
    const { name, url } = getEmailProvider(email);

    return (
      <Box mx={{ base: 4, md: 0 }}>
        <Title>Check your email</Title>
        <Text mt={3}>
          A <b>sign in link</b> has been sent to your email address.{" "}
          {name && url && (
            <>
              Check <Link href={url}>your {name} inbox</Link>.
            </>
          )}
        </Text>
      </Box>
    );
  }

  return (
    <Stack spacing={4} mx="auto" py={12} px={6}>
      <Card>
        <Stack align="center" spacing={0} py={15}>
          <Title>Sign in to UrPicsArt.</Title>
          <Text>Use your email address to sign in</Text>
        </Stack>
        <Box p={8}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (email) {
                login();
              }
            }}
          >
            <Stack spacing={4}>
              <TextInput
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="sarah@gmail.com"
                type="email"
              />
              <Stack spacing={10}>
                <Button
                  loading={isLoading}
                  // rightIcon={<FaPaperPlane />}
                  type="submit"
                  variant="brand"
                >
                  Send magic link
                </Button>
              </Stack>
              <Stack spacing={4}>
                <Button
                  onClick={() =>
                    signIn("google", {
                      redirect: false,
                      callbackUrl: "/",
                    })
                  }
                  leftIcon={<>G</>}
                >
                  Login With Google
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Card>
    </Stack>
  );
}
