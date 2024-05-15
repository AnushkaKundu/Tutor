"use client"
import UserStatisticsChart from './usagestats';
import PieChart from './../pie-chart/page';
const Statistics = (props: any) => {
    return (
        <div>
            {/* <UserStatisticsChart uid = "Mxj1jPA1sSNJcozS2oOsmDao3K83"/> */}
            <UserStatisticsChart uid = "Mxj1jPA1sSNJcozS2oOsmDao3K83"/>
            <hr className="w-1/4 h-1 mx-auto my-20 bg-gray-800 border-0 rounded md:my-10 dark:bg-gray-700"/>
            <PieChart data={[1,2,1]}/>
        </div>
    );
}
export default Statistics;