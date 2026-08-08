export function groupNotifications(
  notifications:any[]
){


const groups:any={};


notifications.forEach(item=>{


const date =
new Date(item.created_at);



const today =
new Date();



const diff =
Math.floor(
(
today.getTime()
-
date.getTime()
)
/86400000
);



let key="Older";


if(diff===0){

key="Today";

}

else if(diff===1){

key="Yesterday";

}



if(!groups[key]){

groups[key]=[];

}



groups[key].push(item);


});



return groups;

}