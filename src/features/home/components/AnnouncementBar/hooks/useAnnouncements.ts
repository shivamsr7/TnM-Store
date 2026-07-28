import { useEffect } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  announcementService
} from "@/features/home/components/AnnouncementBar/services/announcement.service";

import {
  supabase
} from "@/shared/lib/supabase";


export function useAnnouncements() {


const queryClient = useQueryClient();



const query = useQuery({

queryKey:["announcements"],

queryFn:announcementService.getAll,

staleTime:Infinity,

});




useEffect(()=>{


const channelName = "announcements-realtime";


// Remove existing channel before creating new one

const existingChannel =
supabase.getChannels()
.find(
(channel)=>
channel.topic.includes(channelName)
);


if(existingChannel){

supabase.removeChannel(existingChannel);

}





const channel = supabase

.channel(channelName)

.on(

"postgres_changes",

{

event:"*",

schema:"public",

table:"announcements",

},

async()=>{


const announcements =
await announcementService.getAll();



queryClient.setQueryData(

["announcements"],

announcements

);


}

)

.subscribe();





return()=>{


supabase.removeChannel(channel);


};


},[queryClient]);





return query;

}