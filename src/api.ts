// Crypto / JM Mobile API part is ported from https://github.com/hect0x7/JMComic-Crawler-Python

import CryptoJS from 'crypto-js';
import { GM_xmlhttpRequest } from '$';

import { config } from './config';

const APP_TOKEN_SECRET = '18comicAPP';
const APP_DATA_SECRET = '185Hcomic3PAPP7R';
const APP_VERSION = '1.7.9';

interface JMEncodedResponse {
  code: number;
  data: string;
}

export interface JMAlbum {
  id: number;
  name: string;

  /** Unix timestamp */
  addtime: string;

  total_views: string;
  likes: string;
  comment_total: string;

  author: string[];
  tags: string[];
  works: string[];
  actors: string[];
}

const getTokenWithTokenparam = (
  ts: number,
  ver: string = APP_VERSION,
  secret: string = APP_TOKEN_SECRET,
) => {
  const tokenparam = `${ts},${ver}`;
  const token = CryptoJS.MD5(`${ts}${secret}`).toString();
  return {
    token,
    tokenparam,
  };
};

const decodeData = (data: any, ts: number, secret: string = APP_DATA_SECRET) => {
  const dataWordArray = CryptoJS.enc.Base64.parse(data);
  const token = CryptoJS.MD5(`${ts}${secret}`).toString();
  const tokenWordArray = CryptoJS.enc.Utf8.parse(token);
  const encrypted = CryptoJS.lib.CipherParams.create({
    ciphertext: dataWordArray,
  });
  const decrypted = CryptoJS.AES.decrypt(encrypted, tokenWordArray, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};

export const JMFetchAlbumInfo = (
  jmSite: string,
  jmId: string | number,
  callback: (album: JMAlbum | null) => void,
) => {
  const timestamp = Math.floor(Date.now() / 1000);
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://${jmSite}/album?id=${jmId}`,
    timeout: config.timeout,
    headers: {
      ...getTokenWithTokenparam(timestamp),
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': navigator.userAgent,
    },
    onload: (gmResponse) => {
      try {
        const resp: JMEncodedResponse = JSON.parse(gmResponse.responseText);
        const album: JMAlbum = decodeData(resp.data, timestamp);
        callback(album);
      } catch (error) {
        callback(null);
      }
    },
    onerror: () => callback(null),
    ontimeout: () => callback(null),
  });
};
