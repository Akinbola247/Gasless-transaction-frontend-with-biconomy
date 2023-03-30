import { SyntheticEvent, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import relay_abi from "../relay_abi.json"
import { Biconomy } from "@biconomy/mexa";
import { ethers } from 'ethers';


const ContractAddress  = "0xfef5cdd03451fc5e54a10ce43e4bf6727ca2059d"
export type ExternalProvider = {
  isMetaMask?: boolean;
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  request?: (request: { method: string, params?: Array<any> }) => Promise<any>
}


const Home: any = () => {
  const [Dailiq, setDailiq] = useState<number>(0);
  
  async function requestAccounts() {
    //@ts-ignore
    return await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function AddDailiquidity() {
    if (!Dailiq) return
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await requestAccounts()
      const biconomy : any = new Biconomy(
        window.ethereum as ExternalProvider,
        {
          //@ts-ignore
          apiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY,
          debug: true,
          contractAddresses: [ContractAddress]
        }
        );
      const provider = await biconomy.provider;

      const contractInstance = new ethers.Contract(
        ContractAddress,
        relay_abi,
        biconomy.ethersProvider
      );
      await biconomy.init();

      const { data } = await contractInstance.populateTransaction.AddDAILiquidity(Dailiq)

      let txParams = {
        data: data,
        to: ContractAddress,
        from: accounts[0],
        signatureType: "EIP712_SIGN",
      };

      await provider.send("eth_sendTransaction", [txParams]);
    }

  };
  const handleChange = (e : any) =>{
    setDailiq(e.target.value);
  }
  return (
    <div >
      <main>
        <ConnectButton />
      </main>
<form onSubmit={e => { e.preventDefault(); AddDailiquidity(); console.log('sub') }}>
    <label htmlFor=""></label>
    <input type="text" value={Dailiq} onChange={handleChange}/>
    <button type="submit">ADD LIQUIDITY</button>
</form>
    </div>
  );
}
export default Home;
