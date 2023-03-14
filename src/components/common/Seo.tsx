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
  const siteUrl = "https://www.husks.org/";

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
        <meta property="twitter:card" content={`summary_large_image`} />
        <meta property="twitter:url" content={`${siteUrl}`} />
        <meta property="twitter:title" content={`${title}`} />
        <meta property="twitter:label1" content="Est reading time" />
        <meta property="twitter:data1" content="10 minutes" />
        <meta property="twitter:image" content={`${siteUrl}${image}`} />
        <link rel="canonical" href={`${url}`} />
      </Head>
    </>
  );
};

export default React.memo(Seo);
