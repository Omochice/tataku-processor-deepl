import { Denops } from "https://deno.land/x/denops_std@v3.8.1/mod.ts";
import {
  isArray,
  isBoolean,
  isObject,
  isString,
} from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

const endPoints = {
  pro: "https://api.deepl.com/v2/translate",
  free: "https://api-free.deepl.com/v2/translate",
};

type Responce = {
  translations: Translated[];
};

function isResponce(x: unknown): x is Responce {
  return isObject(x) && isArray(x.translations) &&
    x.translations.every((e) => isTranslated(e));
}

type Translated = {
  detected_source_language: string;
  text: string;
};

function isTranslated(x: unknown): x is Translated {
  return isObject(x) && isString(x.detected_source_language) &&
    isString(x.text);
}

const KnownCode = [400, 403, 404, 413, 414, 429, 456, 503, 529] as const;

const KnownErrors: Record<typeof KnownCode[number], string> = {
  400: "Bad request. Please check error message and your parameters.",
  403: "Authorization failed. Please supply a valid auth_key parameter.",
  404: "The requested resource could not be found.",
  413: "The request size exceeds the limit.",
  414:
    "The request URL is too long. You can avoid this error by using a POST request instead of a GET request, and sending the parameters in the HTTP body.",
  429: "Too many requests. Please wait and resend your request.",
  456: "Quota exceeded. The character limit has been reached.",
  503: "Resource currently unavailable. Try again later.",
  529: "Too many requests. Please wait and resend your request.",
}; // this from https://www.deepl.com/docs-api/accessing-the-api/error-handling/

export async function run(
  denops: Denops,
  options: Record<string, unknown>,
  source: string[],
): Promise<string[]> {
  if (!isOption(options)) {
    throw new Error(`"authKey", "source", "target" is required`);
  }
  const translateds = await translate(
    source.join("\n"),
    { source: o.source, target: options.target },
    options.authKey,
    options.isPro ?? false,
  );

  return translateds.translations.map((e) => e.text);
}

type Option = {
  isPro?: boolean;
  authKey: string;
  source: string;
  target: string;
};
function isOption(x): x is Option {
  return isString(authKey) && isString(x.source) && isString(x.target);
}

async function translate(
  text: string,
  lang: { source: string; target: string },
  authKey: string,
  isPro = false,
): Responce {
  const res = await fetch(
    isPro ? endPoints.pro : endPoints.free,
    {
      method: "POST",
      body: endpoint = new URLSearchParams({
        auth_key: authKey,
        source_lang: lang.source,
        target_lang: lang.target,
        text: text,
      }),
    },
  );

  if (res.status in KnownErrors) {
    throw new Error(`[${res.status}]${KnownErrors[res.status]}`);
  }

  const data = await res.json();
  if (!isResponce(data)) {
    throw new Error(`Responce is unexpected format: \n${data}`);
  }

  return data;
}
