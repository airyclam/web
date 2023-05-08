import { Button, Layout, TextInput } from "components";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactNode } from "react";
import { SupportedLocale } from "types/global";
import { DashboardTopNav } from "../..";
import nextI18nextConfig from "next-i18next.config";
import { useRouter } from "next/router";
import {
  EmbedResult,
  EmbedType,
  useEmbedByIdQuery,
  useUpsertEmbedMutation,
  useUpsertQuestionMutation,
} from "generated";
import { useAuth } from "hooks/useAuth";
import { toast } from "react-toastify";
import { Box } from "components/Box/Box";
import { Checkbox } from "components/Checkbox/Checkbox";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

export async function getServerSideProps({
  query,
  locale,
}: {
  query: { slug: string };
  locale: SupportedLocale;
}) {
  return {
    props: {
      slug: query.slug,
      ...(await serverSideTranslations(
        locale,
        ["auth", "common"],
        nextI18nextConfig
      )),
    },
  };
}

type NewQuestionEmbedFormValues = {
  prompt: string;
  enforceCharacterLimit?: boolean;
  characterLimit?: number;
  responsePlaceholderText?: string;
  allowAnonymousResponses?: boolean;
};

function NewQuestionEmbed() {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>New Question Embed</h1>
      </div>

      <Box>
        <QuestionEmbedForm buttonLabel="Create Embed" />
      </Box>
    </>
  );
}

export function QuestionEmbedForm({
  buttonLabel = "Save",
  embed,
}: {
  buttonLabel: string;
  embed?: EmbedResult;
}) {
  const router = useRouter();
  const { query } = router;
  const queryClient = useQueryClient();
  const { slug } = query;
  const { user } = useAuth({ redirect: false });
  const upsertEmbed = useUpsertEmbedMutation();
  const upsertQuestion = useUpsertQuestionMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<NewQuestionEmbedFormValues>({
    mode: "onChange",
    defaultValues: {
      prompt: embed?.question?.prompt,
      enforceCharacterLimit: embed?.question?.responseCharLimit !== null,
      characterLimit: embed?.question?.responseCharLimit || 140,
      responsePlaceholderText: embed?.question?.responsePlaceholderText || "",
      allowAnonymousResponses:
        embed?.question?.allowAnonymousResponses || false,
    },
  });

  const watchCharacterLimit = watch("enforceCharacterLimit");

  const handleCreateEmbed = (data: NewQuestionEmbedFormValues) => {
    const {
      prompt,
      enforceCharacterLimit,
      characterLimit,
      responsePlaceholderText,
    } = data;

    upsertQuestion.mutate(
      {
        input: {
          id: embed?.attributes.questionId as string,
          prompt,
          responseCharLimit: enforceCharacterLimit ? characterLimit : null,
          responsePlaceholderText,
        },
      },
      {
        onSuccess: (data) => {
          upsertEmbed.mutate(
            {
              input: {
                id: embed?.id as string,
                name: "Politician Embed",
                populistUrl: "https://populist.us",
                embedType: EmbedType.Question,
                organizationId: user?.organizationId as string,
                attributes: {
                  questionId: data.upsertQuestion.id,
                  embedType: "question",
                },
              },
            },
            {
              onSuccess: (data) => {
                toast("Embed saved!", {
                  type: "success",
                  position: "bottom-right",
                });
                void queryClient.invalidateQueries(
                  useEmbedByIdQuery.getKey({ id: router.query.id as string })
                );
                void router.push(
                  `/dashboard/${slug}/embeds/question/${data.upsertEmbed.id}`,
                  undefined,
                  {
                    shallow: true,
                  }
                );
              },
            }
          );
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleCreateEmbed)}>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: "1.75rem",
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 4fr",
            gap: "1rem",
          }}
        >
          <h3>Prompt</h3>
          <TextInput
            id="prompt"
            name="prompt"
            size="small"
            placeholder="What question would you like to ask?"
            register={register}
            rules={{
              required: "Prompt is required",
            }}
          />
        </section>
        <section
          style={{
            display: "grid",
            gap: "1rem",
            borderTop: "1px solid var(--blue-dark)",
            padding: "1rem 0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateRows: "auto auto",
              gap: "0.75rem",
            }}
          >
            <Checkbox
              id="allowAnonymousResponses"
              name="allowAnonymousResponses"
              label="Allow Anonymous Responses"
              register={register}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                height: "2rem",
              }}
            >
              <Checkbox
                id="enforceCharacterLimit"
                name="enforceCharacterLimit"
                label="Enforce character limit for responses"
                register={register}
              />
              {watchCharacterLimit && (
                <div style={{ width: "75px" }}>
                  <TextInput
                    size="small"
                    id="characterLimit"
                    name="characterLimit"
                    register={register}
                  />
                </div>
              )}
            </div>
            <TextInput
              id="responsePlaceholderText"
              name="responsePlaceholderText"
              label="Response Placeholder Text"
              size="small"
              placeholder="What placeholder text would you like users to see?"
              register={register}
            />
          </div>
        </section>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "1rem",
        }}
      >
        <Button
          size="medium"
          variant="primary"
          width="fit-content"
          label={buttonLabel}
          type="submit"
          disabled={!isDirty || !isValid || isSubmitting}
        />
      </div>
    </form>
  );
}

NewQuestionEmbed.getLayout = (page: ReactNode) => (
  <Layout>
    <DashboardTopNav />
    {page}
  </Layout>
);

export default NewQuestionEmbed;
