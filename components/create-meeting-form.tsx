"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";

export function CreateMeetingForm() {
  const [title, setTitle] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Meeting Created:", { title });
    // TODO: Connect to backend API
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Schedule a Meeting</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium leading-none">
                Meeting Title
              </label>
              <Input 
                id="title" 
                placeholder="Discuss project roadmap" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit">Schedule</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
