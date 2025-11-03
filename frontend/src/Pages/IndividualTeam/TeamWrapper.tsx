import { useParams } from "react-router-dom";
import Team from "./Team";

export const TeamWrapper = () => {
  const { id } = useParams();
  return <Team teamId={id!} />; 
};