export const notificationTemplates={


orderConfirmed:(order:string)=>({

title:"Order Confirmed",

message:
`Your order #${order} has been confirmed.`

}),



orderShipped:(order:string)=>({

title:"Order Shipped",

message:
`Your order #${order} is on the way.`

}),



rewardEarned:(points:number)=>({

title:"Reward Points Earned",

message:
`You earned ${points} reward points.`

})


}