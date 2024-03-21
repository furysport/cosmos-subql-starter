import { TransferEvent, Message } from "../types";
import {
  CosmosEvent,
  CosmosBlock,
  CosmosMessage,
  CosmosTransaction,
} from "@subql/types-cosmos";

// export async function handleBlock(block: CosmosBlock): Promise<void> {
//   // No specific handling for blocks in this example
// }
// 
// export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
//   // No specific handling for transactions in this example
// }

export async function handleMessage(msg: CosmosMessage): Promise<void> {
  const messageRecord = Message.create({
    id: `${msg.tx.hash}-${msg.idx}`,
    blockHeight: BigInt(msg.block.block.header.height),
    txHash: msg.tx.hash,
    from: msg.msg.decodedMsg.fromAddress,
    to: msg.msg.decodedMsg.toAddress,
    amount: JSON.stringify(msg.msg.decodedMsg.amount),
  });
  await messageRecord.save();
}

export async function handleEvent(event: CosmosEvent): Promise<void> {
  const eventRecord = TransferEvent.create({
    id: `${event.tx.hash}-${event.msg.idx}-${event.idx}`,
    blockHeight: BigInt(event.block.block.header.height),
    txHash: event.tx.hash,
    recipient: "",
    amount: "",
    sender: "",
  });
  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case "recipient":
        eventRecord.recipient = attr.value;
        break;
      case "amount":
        eventRecord.amount = attr.value;
        break;
      case "sender":
        eventRecord.sender = attr.value;
        break;
      default:
        break;
    }
  }
  await eventRecord.save();
}

export async function handlePoolData({ chainNameId, address }: { chainNameId: string, address: string }): Promise<void> {
  try {
    // Make a GET request to the endpoint
    const response = await fetch(`https://api.furya.xyz/cosmwasm/wasm/v1/contract/${address}/smart/eyJwb29sIjp7fX0=`);
    
    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch pool data. Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract relevant data from the response
    const assets = data.data.assets.map((asset: any) => ({
      info: {
        native_token: {
          denom: asset.info.native_token.denom,
        },
      },
      amount: asset.amount,
    }));
    const total_share = data.data.total_share;

    // Save the extracted data or process it further as needed
    console.log("Pool Data:", assets);
    console.log("Total Share:", total_share);
    
    // You can now save the extracted data to the database or perform further processing
  } catch (error) {
    console.error("Error fetching pool data:", error);
    // Handle errors appropriately
  }
}

export async function handleFlowsData({ chainNameId, address }: { chainNameId: string, address: string }): Promise<void> {
  try {
    // Make a GET request to the endpoint
    const response = await fetch(`https://api.furya.xyz/cosmwasm/wasm/v1/contract/${address}/smart/eyJmbG93cyI6e319`);

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch flows data. Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract relevant data from the response
    const flows = data.data.map((flow: any) => ({
      flow_id: flow.flow_id,
      flow_label: flow.flow_label,
      flow_creator: flow.flow_creator,
      flow_asset: {
        info: {
          native_token: {
            denom: flow.flow_asset.info.native_token.denom,
          },
        },
        amount: flow.flow_asset.amount,
      },
      claimed_amount: flow.claimed_amount,
      curve: flow.curve,
      start_epoch: flow.start_epoch,
      end_epoch: flow.end_epoch,
      emitted_tokens: flow.emitted_tokens,
      asset_history: flow.asset_history,
    }));

    // Save the extracted data or process it further as needed
    console.log("Flows:", flows);

    // You can now save the extracted data to the database or perform further processing
  } catch (error) {
    console.error("Error fetching flows data:", error);
    // Handle errors appropriately, e.g., log the error, send a notification, etc.
    // You can also throw the error to propagate it further if needed
  }
}

export async function handlePrices(): Promise<void> {
  try {
    // Make a GET request to the endpoint
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=fanfury,usk,shade-protocol,comdex,sei-network,osmosis,juno-network,cosmos,injective-protocol,chihuahua-token,kujira&vs_currencies=usd");
    
    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch prices. Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract relevant data from the response
    const prices = Object.entries(data).map(([id, priceData]: [string, any]) => ({
      id,
      usd: priceData.usd,
    }));

    // Save the extracted data or process it further as needed
    console.log("Prices:", prices);

    // You can now save the extracted data to the database or perform further processing
  } catch (error) {
    console.error("Error fetching prices:", error);
    // Handle errors appropriately, e.g., log the error, send a notification, etc.
    // You can also throw the error to propagate it further if needed
  }
}
