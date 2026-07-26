export interface MembershipTier {

  name: string;

  color: string;

  benefits: string[];

}


export interface NextTier {

  name: string;

  amount: number;

}



export interface RewardRules {

  point_value_points: number;

  point_value_amount: number;

}



export interface CustomerMembership {


  tier: MembershipTier;


  points: number;


  rewardValue: number;


  lifetimeSpend: number;


  nextTier: NextTier | null;


  progress: number;


  welcomeBonusGiven: boolean;


  rules: RewardRules;


}