import React, { useEffect, useState } from "react";
import { AppProps } from "next/app";
import WrappedApp from "../components/app";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <WrappedApp Component={Component} pageProps={pageProps} />
    </>
  );
}
