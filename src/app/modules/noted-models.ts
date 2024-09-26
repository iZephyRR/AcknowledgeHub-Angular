import { Target } from "../constants";

export interface NotedPreview {
     receiverType:Target;
    receiverId: bigint;
    receiverName: string;
    notedProgress: number;
}

export interface NotedPreview2 {
    receiverName: string;
    receiverType: Target;
    notedProgress: number;
    childPreviews?: NotedPreview2[];
}
