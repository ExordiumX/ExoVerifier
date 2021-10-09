import axios from "axios";
import input from "input";
import config from "./config.js";

const sleep = (t) => new Promise((s) => setTimeout(s, t));

const getToken = async (mail, password) => {
  let {
    data: { token },
  } = await axios.post(
    "https://discord.com/api/v9/auth/login",
    {
      login: mail,
      password: password,
      undelete: false,
      captcha_key: null,
      login_source: null,
      gift_code_sku_id: null,
    },
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
  return token;
};

let verify = async (tokenn, password, countryCode, mail) => {
  try {
    let {
      data: { number, tzid },
    } = await axios.get(
      `https://onlinesim.ru/api/getNum.php?apikey=${config.apiKey}&service=discord&number=true&country=${countryCode}`
    );
    if (!number) {
      console.log("Invalid API key.");
      await sleep(3000);
      return;
    }
    console.log("Verifying with " + number);

    let res = await axios.post(
      "https://discord.com/api/v9/users/@me/phone",
      { phone: number },
      {
        headers: {
          accept: " */*",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "it",
          authorization: tokenn,
          "content-type": "application/json",
          origin: "https://discord.com",
          referer: "https://discord.com/channels/@me",
          "sec-ch-ua":
            'Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "Windows",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
          "x-debug-options": "bugReporterEnabled",
          "x-super-properties":
            "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkzLjAuNDU3Ny44MiBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiOTMuMC40NTc3LjgyIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tL2xvZ2luIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjk3NjYyLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
        },
      }
    );

    console.log("Waiting for code...");
    let msgres;
    let msg;
    let count = 0;
    while (!msg) {
      if (count > 15) {
        console.log("Failed to receive code. Please try again.");
        return;
      }
      msgres = await axios.get(
        `https://onlinesim.ru/api/getState.php?apikey=0ba5f5de626a9d0928def3c49f0eb50f&tzid=${tzid}`
      );
      msg = msgres.data[0].msg;
      count = count + 1;
      await sleep(5000);
    }
    console.log("Received code " + msg);

    let {
      data: { token },
    } = await axios.post(
      "https://discord.com/api/v9/phone-verifications/verify",
      { phone: number, code: msg },
      {
        headers: {
          accept: " */*",
          "accept-language": "it",
          authorization: tokenn,
          "content-type": "application/json",
          origin: "https://discord.com",
          referer: "https://discord.com/channels/@me",
          "sec-ch-ua":
            'Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "Windows",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
          "x-debug-options": "bugReporterEnabled",
          "x-super-properties":
            "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkzLjAuNDU3Ny44MiBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiOTMuMC40NTc3LjgyIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tL2xvZ2luIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjk3NjYyLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
        },
      }
    );

    let final = await axios.post(
      "https://discord.com/api/v9/users/@me/phone",
      {
        phone_token: token,
        password: password,
      },
      {
        headers: {
          accept: " */*",
          "accept-language": "it",
          authorization: tokenn,
          "content-type": "application/json",
          origin: "https://discord.com",
          referer: "https://discord.com/channels/@me",
          "sec-ch-ua":
            'Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "Windows",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
          "x-debug-options": "bugReporterEnabled",
          "x-super-properties":
            "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkzLjAuNDU3Ny44MiBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiOTMuMC40NTc3LjgyIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tL2xvZ2luIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjk3NjYyLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
        },
      }
    );
    console.log("Successfully verified " + mail);
    await sleep(3000);
  } catch (e) {
    console.log(e);
  }
};

const main = async () => {
  const mail = await input.text("Enter your mail");
  const password = await input.password("Enter your password");
  let country = await input.text("Enter your country code", {
    default: "+7",
  });
  country = country.split("+")[1];
  await verify(await getToken(mail, password), password, country, mail);
};

main();
