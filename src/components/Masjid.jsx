import seriesData from "../api/seriesData.json";
import { MasjidCard } from "./MasjidCard";
const Masjid = () =>{
return (
<ul className="grid grid-three--cols">
    {seriesData.map((currEmp) => (
        <MasjidCard key = {currEmp.id} data = {currEmp}/>
    ))}
</ul>
);
};
export default Masjid;