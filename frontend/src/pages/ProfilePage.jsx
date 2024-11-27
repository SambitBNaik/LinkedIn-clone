import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { useParams } from 'react-router-dom'
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import ProfileHeader from '../components/ProfileHeader';
import AboutSection from '../components/AboutSection';
import ExperienceSection from '../components/ExperienceSection';
import EducationSection from '../components/EducationSection';
import SkillsSection from '../components/SkillsSection';

const ProfilePage = () => {
    const {username}=useParams();
    const queryClient=useQueryClient();

    const{ data: authUser, isLoading}=useQuery({
        queryKey: ['authUser'],
    })

    const { data: userProfile , isLoading: isUserProfileLoading}= useQuery({
        queryKey:["userProfile", username],
        queryFn:()=> axiosInstance.get(`/users/${username}`),
    });

    const { mutate: updateProfile}=useMutation({
        mutationFn: async(updateData)=>{
            await axiosInstance.put("/users/profile", updateData);
        },
        onSuccess:()=>{
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries(["userProfile", username]);
        },
    });

    if(isLoading || isUserProfileLoading) return null;

    const isOwnProfile = authUser.username === userProfile.data.username;
    const userData= isOwnProfile ? authUser : userProfile.data;

    const handleSave=(updatedData)=>{
        updateProfile(updatedData);
    };

    console.log("own profile", isOwnProfile);
  return (
    <div>
        <ProfileHeader userData={userData} onSave={handleSave} isOwnProfile={isOwnProfile} />
        <AboutSection userData={userData} onSave={handleSave} isOwnProfile={isOwnProfile}/>
        <ExperienceSection userData={userData} onSave={handleSave} isOwnProfile={isOwnProfile}/>
        <EducationSection userData={userData} onSave={handleSave} isOwnProfile={isOwnProfile}/>
        <SkillsSection userData={userData} onSave={handleSave} isOwnProfile={isOwnProfile}/>
    </div>
  )
}

export default ProfilePage