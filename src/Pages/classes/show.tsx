import React from 'react'
import {useShow} from "@refinedev/core";
import {ClassDetails} from "@/types";
import {ShowView, ShowViewHeader} from "@/components/refine-ui/views/show-view.tsx";
import {Card} from "@/components/ui/card.tsx";

const Show = () => {

    const {query} = useShow<ClassDetails>({resource: "classes"})

    const classDetails=query.data?.data;

    const {data,isLoading,isError}=query;

    if(isLoading || isError || !classDetails){
        return (
            <ShowView className="class-view class-shows">
                <ShowViewHeader resource="classes" title="Class Details" />
                <p className="state-message">
                    {isLoading ? "Loading class details..." : isError ? 'Failed to fetch class details...' : 'Class details not found.' }
                </p>
            </ShowView>
        )
    }


    const teacherName= classDetails.teacher?.name ?? 'Unknown';
    const teacherInitials =
        teacherName.split('')
            .filter(Boolean)
            .slice(0,2)
            .map((part)=> part[0]?.toUpperCase())
            .join(' ');


    const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(teacherInitials || 'NA')}`;


    return (
        <ShowView className="class-view class-show">
            <ShowViewHeader resource="classes" title="Class Details" />

            <div className="banner">
                {
                    classDetails.bannerUrl ?  <p>Render Clodinary's advanced image</p>:
                        <div className="placeholder"/>
                }
            </div>

            <Card className="details-header">
                <div>
                    <h1>
                        {classDetails.name}
                    </h1>
                    <p>
                        {classDetails.description}
                    </p>
                </div>
            </Card>
        </ShowView>
    )
}
export default Show
