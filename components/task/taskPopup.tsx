"use client"
import { useState } from "react";


interface TaskPopupProps {
  isOpen : boolean;
  onClose : ()=>void;
  projectId :string;
  columnId : string;
  onTaskCreated : ()=>void;
}

export const TaskPopup = ({isOpen,onClose,projectId,columnId,onTaskCreated}: TaskPopupProps) => {
 
  const [title, setTitle] = useState("");
  const [description , setDescription] = useState("");
  const [loading,setLoading] = useState("")

}

