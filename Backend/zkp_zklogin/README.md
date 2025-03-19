# Expander Zklogin Worflow

## off chain Client aka Frontend [.ts]
- get JWT from OCID
- Decode JWT
- Get Salt
- Blake twice using [aud, sub, salt, email]
- Do Keccake256 
- Derive ETH using Keccake256 seed
- POST /zkproof [aud, sub, salt, email, address] 

## off Chain Backend [.ts], [.rs]
- Get Decoded JWT
- Blake twice to get 128 byte hash
- input [Blake, address] to circuit
- Do keccak256
- use hint to derieve ETH address from keccak256 seed
- compare hint output with circuit expected output => (output == address)
- generate witness, proof
- return witness + proof
- sign message contains date+ proof + ETH address

## off chain Client aka Frontend [.ts]
- Query Smart contract with signed message + address

## On Chain [.sol]
- decode message 
- check is right signare?
- check date > now
- check (client address) == (proof address)
- True? allow signin