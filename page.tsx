import type { Metadata } from "next";
import { GameRoom } from "@/components/game/game-room";

export const metadata: Metadata = { title: "Game room" };

export default function PlayPage() {
  return <GameRoom />;
}
