"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { useRouter } from "next/navigation";
import { AnimatedText } from "./animated-underline-text-one";
import DashboardQuickLinks from "./DashboardQuickLinks";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

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
        initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex flex-col items-center justify-start pt-24 px-4"
      >
        <Card className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white/90 backdrop-blur shadow-lg transition hover:shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              <AnimatedText text="Namaste User 🙏" />
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Add your application details to get started
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Application Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. My Portfolio Site"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-medium">
                Application Domain
              </Label>
              <Input
                id="domain"
                placeholder="e.g. example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl font-medium"
            >
              {loading ? "Adding..." : "➕ Add Application"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-12 w-full flex justify-center">
          <DashboardQuickLinks />
        </div>
      </motion.div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Application Created!
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Your application has been created successfully. Use the
              credentials below:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm mt-4">
            <div className="p-2 rounded-lg bg-gray-50">
              <strong>API Endpoint:</strong>{" "}
              <code>/api/{createdApp?.uuid}</code>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <strong>Public Key:</strong> <code>{createdApp?.appKey}</code>
            </div>
            <div className="p-2 rounded-lg bg-gray-50">
              <strong>Secret Key:</strong> <code>{createdApp?.secretKey}</code>
            </div>
          </div>

          <Button
            onClick={() => setShowDialog(false)}
            className="mt-6 w-full rounded-xl"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Toasts */}
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
