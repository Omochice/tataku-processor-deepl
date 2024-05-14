import { Denops } from "https://deno.land/x/denops_std@v6.4.3/mod.ts";
import {
  $array,
  $boolean,
  $object,
  $opt,
  $string,
  access,
  type Infer,
} from "https://esm.sh/lizod@0.2.7/";

const endPoints = {
  pro: "https://api.deepl.com/v2/translate",
  free: "https://api-free.deepl.com/v2/translate",
} as const;

const isResponse = $object({
  translations: $array($object({
    detected_source_language: $string,
    text: $string,
  })),
});

type Response = Infer<typeof isResponse>;

const KnownErrors = new Map([
  [400, "Bad request. Please check error message and your parameters."],
  [403, "Authorization failed. Please supply a valid auth_key parameter."],
  [404, "The requested resource could not be found."],
  [413, "The request size exceeds the limit."],
  [
    414,
    "The request URL is too long. You can avoid this error by using a POST request instead of a GET request, and sending the parameters in the HTTP body.",
  ],
  [429, "Too many requests. Please wait and resend your request."],
  [456, "Quota exceeded. The character limit has been reached."],
  [503, "Resource currently unavailable. Try again later."],
  [529, "Too many requests. Please wait and resend your request."],
]); // this from https://www.deepl.com/docs-api/accessing-the-api/error-handling/

const isOption = $object({
  isPro: $opt($boolean),
  authKey: $string,
  source: $string,
  target: $string,
});

async function translate(
  text: string,
  lang: { source: string; target: string },
  authKey: string,
  isPro = false,
): Promise<Response> {
  const res = await fetch(
    isPro ? endPoints.pro : endPoints.free,
    {
      method: "POST",
      body: new URLSearchParams({
        auth_key: authKey,
        source_lang: lang.source,
        target_lang: lang.target,
        text: text,
      }),
    },
  );

  if (KnownErrors.has(res.status)) {
    throw new Error(`[${res.status}]${KnownErrors.get(res.status)!}`);
  }

  const data = await res.json();
  if (!isResponse(data)) {
    throw new Error(`Responce is unexpected format: \n${data}`);
  }

  return data;
}

const processor = (
  _: Denops,
  option: Record<string, unknown>,
) => {
  const ctx = { errors: [] };
  if (!isOption(option, ctx)) {
    throw new Error(
      ctx.errors
        .map((e) => `error occur: ${access(option, e)}`)
        .join("\n"),
    );
  }
  return new TransformStream<string[]>({
    transform: async (chunk: string[], controller) => {
      const translateds = await translate(
        chunk.join("\n"),
        option,
        option.authKey,
        option.isPro ?? false,
      );

      controller.enqueue(translateds.translations.map((e) => `${e.text}\n`));
    },
  });
};

export default processor;
