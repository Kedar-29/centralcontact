"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { AnimatedText } from "./animated-underline-text-one";
import DashboardQuickLinks from "./DashboardQuickLinks";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";

export default function AddWebsiteForm() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [createdApp, setCreatedApp] = useState<null | {
    uuid: string;
    appKey: string;
    secretKey: string;
  }>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name || !domain) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, domain }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedApp(data);
        setShowDialog(true);
        setName("");
        setDomain("");
        toast.success("Application added successfully!");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to add application");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col items-center justify-start pt-24 px-4"
      >
        <Card className="w-full max-w-xl shadow-xl border border-border bg-card/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">
              <AnimatedText text="Namaste User " />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Application Name</Label>
              <Input
                id="name"
                placeholder="e.g. My Portfolio Site"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Application Domain</Label>
              <Input
                id="domain"
                placeholder="e.g. example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Adding..." : "Add Application"}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-10 w-full flex justify-center">
          <DashboardQuickLinks />
        </div>
      </motion.div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Created!</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your application has been created successfully. Use the
              credentials below:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm mt-4">
            <div>
              <strong>API Endpoint:</strong>{" "}
              <code>/api/{createdApp?.uuid}</code>
            </div>
            <div>
              <strong>Public Key:</strong> <code>{createdApp?.appKey}</code>
            </div>
            <div>
              <strong>Secret Key:</strong> <code>{createdApp?.secretKey}</code>
            </div>
          </div>

          <Button onClick={() => setShowDialog(false)} className="mt-4 w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          duration: 4000,
          style: { fontWeight: "500" },
        }}
      />
    </>
  );
}
