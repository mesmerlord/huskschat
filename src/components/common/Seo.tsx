import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";

interface SeoProps {
  description: string;
  title: string;
  url?: string;
  image?: string;
}

const Seo = ({ description, title, url, image }: SeoProps) => {
  const siteName = "Husks";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={`${description}`} />
        <meta property="og:description" content={`${description}`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${title}`} />
        <meta property="og:site_name" content={`${siteName}`} />
        <meta property="og:image" content={`${image}`} />
        <meta name="twitter:card" content={`${description}`} />
        <meta name="twitter:title" content={`${title}`} />
        <meta name="twitter:label1" content="Est reading time" />
        <meta name="twitter:data1" content="10 minutes" />
        <meta name="twitter:image" content={`${image}`} />
        <link rel="canonical" href={`${url}`} />
      </Head>
    </>
  );
};

export default React.memo(Seo);
