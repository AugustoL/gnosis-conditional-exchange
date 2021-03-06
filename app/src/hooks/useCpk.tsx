import CPK from 'contract-proxy-kit'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react'

import { CPKService } from '../services'

/**
 * Returns an instance of CPKService. While the instance is being (asynchronously) created, the returned value is null.
 */
export const useCpk = (): Maybe<CPKService> => {
  const [cpk, setCpk] = useState<Maybe<CPKService>>(null)
  const { account, library } = useWeb3Context()

  useEffect(() => {
    if (account && library) {
      const signer = library.getSigner()

      CPK.create({ ethers, signer })
        .then(cpk => new CPKService(cpk, library))
        .then(setCpk)
    }
  }, [account, library])

  return cpk
}
