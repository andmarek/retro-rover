import "@radix-ui/themes/styles.css";
import { Inter } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import NavBar from "./navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RetroRover",
  description: "A simplified way to run sprint retrospectives",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en" className={GeistSans.className}>
      <body className={inter.className}>
        <NavBar />
        <Theme
          appearance="dark"
          grayColor="gray"
          accentColor="mint"
          radius="large"
          scaling="100%"
          panelBackground="translucent"
        >
          {" "}
          {children}{" "}
        </Theme>
      </body>
    </html>
  );
}
