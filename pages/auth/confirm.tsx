import BasicLayout from "components/BasicLayout/BasicLayout";
import { useConfirmUserEmailMutation } from "generated";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import styles from "components/Auth/Auth.module.scss";
import layoutStyles from "components/BasicLayout/BasicLayout.module.scss";
import Link from "next/link";

const ConfirmEmail: NextPage = () => {
  const { query } = useRouter();
  const { token } = query;
  const mutation = useConfirmUserEmailMutation();

  useEffect(() => {
    if (typeof token == "string") mutation.mutate({ token });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (mutation.isSuccess) {
    return (
      <BasicLayout hideFooter>
        <div className={styles.container}>
          <h1>Congradulations, your account has been confirmed!</h1>
          <p>We're excited to have you.</p>
          <button>LOG IN NOW</button>
        </div>
      </BasicLayout>
    );
  } else
    return (
      <BasicLayout>
        <h1>Whoops!</h1>
        <div
          className={styles.formWrapper}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>
            Your email could not be verified. You can reach out to us at{" "}
            <a
              href="mailto: info@populist.us"
              className={layoutStyles.textLink}
            >
              info@populist.us
            </a>{" "}
            for help.
          </p>
          <Link href="/login" passHref>
            <button>LOG IN NOW</button>
          </Link>
        </div>
      </BasicLayout>
    );
};

export default ConfirmEmail;