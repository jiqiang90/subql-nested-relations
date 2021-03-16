import {SubstrateExtrinsic} from "@subql/types";
import {Call} from "../types/models/Call";
import {Vec} from "@polkadot/types"
import {AnyTuple, CallBase} from "@polkadot/types/types"

function extractCalls(call: CallBase<AnyTuple>, id: number, parentCallId:string): Call[]{
    const callId = `${parentCallId}-${id}`
    const entity = new Call(callId);
    entity.method = call.method
    entity.module = call.section;
    entity.parentCallId = parentCallId;
    if (call.method == 'batchAll' && call.section == 'utility'){
        const calls = call.args[0] as Vec<CallBase<AnyTuple>>
        return [].concat.apply([],(calls.map((call,idx) =>
            extractCalls(call,idx,callId)
        )))
    }else{
        return [];
    }

}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void>{
    const calls =  extractCalls(extrinsic.extrinsic.method,extrinsic.idx,extrinsic.block.block.header.number.toString())
    await Promise.all(calls.map((call) => call.save()))

}





