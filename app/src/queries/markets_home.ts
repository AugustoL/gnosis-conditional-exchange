import { BigNumber } from 'ethers/utils'
import gql from 'graphql-tag'

import { MarketFilters, MarketStates } from './../util/types'

export const MarketDataFragment = gql`
  fragment marketData on FixedProductMarketMaker {
    id
    collateralVolume
    collateralToken
    outcomeTokenAmounts
    title
    outcomes
    openingTimestamp
    arbitrator
    category
    templateId
  }
`

export type GraphMarketMakerDataItem = {
  id: string
  collateralVolume: string
  collateralToken: string
  outcomeTokenAmounts: string[]
  title: string
  outcomes: Maybe<string[]>
  openingTimestamp: string
  arbitrator: string
  category: string
  templateId: string
}

export type MarketMakerDataItem = {
  address: string
  collateralVolume: BigNumber
  collateralToken: string
  outcomeTokenAmounts: BigNumber[]
  title: string
  outcomes: Maybe<string[]>
  openingTimestamp: Date
  arbitrator: string
  category: string
  templateId: number
}

export const DEFAULT_OPTIONS = {
  state: MarketStates.open,
  isCoronaVersion: false,
  category: 'All',
  title: null as Maybe<string>,
  arbitrator: null as Maybe<string>,
  templateId: null as Maybe<string>,
  currency: null as Maybe<string>,
  sortBy: null as Maybe<string>,
}

type buildQueryType = MarketFilters & { isCoronaVersion: boolean }
export const buildQueryMarkets = (options: buildQueryType = DEFAULT_OPTIONS) => {
  const { arbitrator, category, currency, isCoronaVersion, state, templateId, title } = options
  const whereClause = [
    state === MarketStates.closed ? 'answerFinalizedTimestamp_gt: $now' : '',
    state === MarketStates.open ? 'answerFinalizedTimestamp: null' : '',
    state === MarketStates.pending ? 'answerFinalizedTimestamp_lt: $now' : '',
    state === MarketStates.myMarkets || isCoronaVersion ? 'creator_in: $accounts' : '',
    category === 'All' ? '' : 'category: $category',
    title ? 'title_contains: $title' : '',
    currency ? 'collateralToken: $currency' : '',
    arbitrator ? 'arbitrator: $arbitrator' : '',
    templateId ? 'templateId: $templateId' : !isCoronaVersion ? 'templateId_in: ["0", "2", "6"]' : '',
    'fee: $fee',
  ]
    .filter(s => s.length)
    .join(',')
  const query = gql`
    query GetMarkets($first: Int!, $skip: Int!, $sortBy: String, $category: String, $title: String, $currency: String, $arbitrator: String, $templateId: String, $accounts: [String!], $now: String, $fee: String) {
      fixedProductMarketMakers(first: $first, skip: $skip, orderBy: $sortBy, orderDirection: desc, where: { ${whereClause} }) {
        ...marketData
      }
    }
    ${MarketDataFragment}
  `
  return query
}
