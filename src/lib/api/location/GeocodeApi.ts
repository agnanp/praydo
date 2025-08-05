import { fetch } from "@tauri-apps/plugin-http";
import { getEnv } from "../../env";

export const geocode = async (place: string) => {
  const url: string = await getEnv("GEOCODE_BASE_URL");

  const params = new URLSearchParams({
    q: place,
    format: "json",
    limit: "1",
  });

  return await fetch(`${url}?${params}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Praydo/0.4 (https://github.com/agnanp/praydo; praydo@apr.my.id)",
    },
  });
};
