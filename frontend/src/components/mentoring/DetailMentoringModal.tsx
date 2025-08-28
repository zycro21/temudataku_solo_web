"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Clock, Wrench, Video, Search } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";

interface DetailMentoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailMentoringModal({
    isOpen,
    onClose,
}: DetailMentoringModalProps) {

    return(
        <Dialog open={isOpen} onOpenChange={onClose}>
            
        </Dialog>
    )
}