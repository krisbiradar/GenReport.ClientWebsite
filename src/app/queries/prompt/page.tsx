'use client'
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Settings, Send, Circle, Loader } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchUserProfile } from "@/state-management/slices/user-slice";
import { RootState, AppDispatch } from "@/state-management/store/app-store";
import { Separator } from "@/components/ui/separator";
import { addMessage } from "@/state-management/slices/chat-slice";

export default function Prompt(): React.JSX.Element {
    const [input, setInput] = useState("");
    const [db, setDb] = useState("green"); // green, yellow, red
    const [examples, setExamples] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { username, profileUrl } = useSelector((state: RootState) => state.user);
    const messages = useSelector((state: RootState) => state.chat.messages);

    useEffect(() => {
        dispatch(fetchUserProfile());
        // Simulate database status check


        // Fetch examples from an API or define them here
        const fetchExamples = async () => {
            const response = await fetch('/api/prompt-examples');
            const data = await response.json();
            setExamples(data);
        };

        fetchExamples();
    }, [dispatch]);

    const handleSend = () => {
        setLoading(true);
        // Simulate sending message
        setTimeout(() => {
            dispatch(addMessage({ user: "User", text: input }));
            setLoading(false);
            setInput("");
        }, 2000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (
        <div className="h-screen flex bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="w-2/12 bg-gray-800 p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Prompt Examples</h2>
                <ul>
                    {examples.map((example, index) => (
                        <li key={index} className="mb-2">{example}</li>
                    ))}
                </ul>
            </div>
            <Separator orientation="vertical" className="bg-gray-700" />
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <header className="flex items-center p-2 border-b border-gray-700">
                    <div className="flex items-center ml-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center focus:outline-none" >
                                <span className="text-white font-medium">Database</span>
                                <span className="ml-2 text-sm text-gray-400"></span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Staging</DropdownMenuItem>
                                <DropdownMenuItem>Testing</DropdownMenuItem>
                                <DropdownMenuItem>Local</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="ml-auto flex items-center space-x-3">

                        <Avatar className="h-8 w-8 bg-gray-700">
                            {profileUrl ? (
                                <AvatarImage src={profileUrl} alt={username} />
                            ) : (
                                <AvatarFallback className="text-white">{username?.charAt(0)}</AvatarFallback>
                            )}
                        </Avatar>
                    </div>
                </header>

                {/* Chat Content */}
                <main className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-normal">
                            <span className="text-blue-400">Hello,</span>{" "}
                            <span className="text-rose-400">{username}</span>
                        </h1>
                    </div>
                    <div className="w-full max-w-2xl mt-4">
                        {messages.map((message: { user: string; text: string }, index: number) => (
                            <div key={index} className={`p-2 rounded mb-2 ${message.user === "User" ? "bg-gray-600 self-end" : "bg-blue-600"}`}>
                                {message.user}: {message.text}
                            </div>
                        ))}
                    </div>
                </main>

                {/* Bottom Input */}
                <div className="p-4 flex justify-center">
                    <div className="w-full max-w-2xl relative">
                        <Input
                            type="text"
                            className="w-full pl-4 pr-12 py-6 bg-gray-800 border-gray-700 rounded-full text-white placeholder-gray-400 focus-visible:ring-gray-600"
                            placeholder="Talk to your Database"
                            value={input}
                            onChange={handleInputChange}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-700" onClick={handleSend} disabled={loading}>
                                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}