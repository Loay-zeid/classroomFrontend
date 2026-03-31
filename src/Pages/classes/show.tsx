import React from 'react'
import {useShow} from "@refinedev/core";
import {ClassDetails} from "@/types";
import {ShowView, ShowViewHeader} from "@/components/refine-ui/views/show-view.tsx";
import {Card} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { bannerPhoto } from "@/lib/cloudinary.ts";

const Show = () => {

    const {query} = useShow<ClassDetails>({resource: "classes"})

    const classDetails=query.data?.data;

    const { isLoading, isError } = query;

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

    const { name, description, status, capacity, bannerUrl, bannerCldPubId, subject, teacher, department } = classDetails;
    const cloudinaryBanner = bannerCldPubId ? bannerPhoto(bannerCldPubId, name).toURL() : "";

    return (
        <ShowView className="class-view class-show">
            <ShowViewHeader resource="classes" title="Class Details" />

            <div className="banner">
                {bannerUrl ? (
                    <img src={cloudinaryBanner || bannerUrl} alt="Class Banner" />
                ) : (
                    <div className="placeholder"></div>
                )}
            </div>

            <Card className="details-card">
                <div className="details-header">
                    <div>
                        <h1>
                            {name}
                        </h1>
                        <p>
                            {description}
                        </p>
                </div>
                    <div>
                        <Badge variant="outline" >{capacity} spots</Badge>
                        <Badge variant={status == 'active'?'default' : 'secondary'} data-status={status}>{status.toUpperCase()}</Badge>
                    </div>
                </div>
                <div className="details-grid">
                    <div className="instructor">
                        <p>
                            instructor
                        </p>
                        <div>
                            <img src={teacher?.image ?? placeholderUrl} alt={teacherName} />
                            <div>
                                <p>{teacherName}</p>
                                <p>{teacher?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="department">
                        <p>Department</p>

                        <div>
                           <p> {department?.name} </p>
                            <p> {department?.description}</p>
                        </div>
                    </div>
                </div>

                <Separator/>

                <div className="subject">
                    <p>Subject</p>
                    <div>
                        <Badge variant="outline">Code: {subject?.courseCode}</Badge>
                        <p>{subject?.name}</p>
                        <p>{subject?.briefDescription}</p>
                    </div>
                </div>

                <Separator/>
                <div className="join">
                    <h2>Join Class</h2>

                    <ol>
                        <li>Ask your teacher for the invite code </li>
                        <li>Click on "join class" button </li>
                        <li>Paste the code and click "join" </li>

                    </ol>
                </div>
                <Button className="w-full" size="lg">
                    Join Class
                </Button>
            </Card>
        </ShowView>
    )
}
export default Show
