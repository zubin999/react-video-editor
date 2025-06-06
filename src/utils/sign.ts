import { Md5 } from 'ts-md5'
// import useDataState from '@/features/editor/store/use-data-state'

function customEncodeURIComponent(str: string|null | FormDataEntryValue) {
    if (str == null) {
        return '';
    }

    if (typeof str === 'string') {
        return encodeURIComponent(str).replace(/\(/g, '%28').replace(/\)/g, '%29')
            .replace(/!/g, '%21').replace(/\*/g, '%2A').replace(/'/g, '%27');
    }

}

export const getSign = (params: FormData | URLSearchParams) => {

    const str: string[] = [];
    if (params instanceof FormData) {
        Array.from(params.keys()).sort().forEach(key => {
            const v = customEncodeURIComponent(params.get(key));
            str.push(`${key}=${v}`)
        })
    } else {
        [...params.keys()].sort().forEach(key => {
            const v = customEncodeURIComponent(params.get(key))
            str.push(`${key}=${v}`)
        })
    }

    const str1: string = str.join('&')
    const secret: string = import.meta.env.VITE_API_SECRET;
    const md5sign = Md5.hashStr(`${str1}${secret}`);

    return md5sign;

}

export async function httpReq(params: FormData | URLSearchParams, url: string, method: string = 'POST', headers: { [key: string]: string } = {}) {
    const timeStamp = Math.round(new Date().getTime() / 1000);
    const uniqueId = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        .join("")
        .substring(0, 16);


    params.append('timestamp', timeStamp.toString());
    params.append('uniqueid', uniqueId);


    params.append('sessionid', window.sessionStorage.getItem('sessionid') || '')
    params.append('platform', window.sessionStorage.getItem('platform') || '1')

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        method: method,
        headers: {
            'Sign': getSign(params),
            'AppKey': `${import.meta.env.VITE_API_KEY}`,
            ...headers
        },
        body: params
    })

    const { data, error_code, error_msg } = await res.json();
    console.log({ data, error_code, error_msg })
    if (error_code === 0) {
        return data;
    } else {
        throw new Error(error_msg);
    }
}