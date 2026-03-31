import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Warning as AlertTriangle, EnvelopeSimple as Mail, ArrowLeft } from "@phosphor-icons/react";

export default function PosInactive() {
  return (
    <div className="min-h-screen overflow-x-hidden w-full bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Subscription Inactive
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your Storm POS subscription is currently inactive. Please contact our support team to reactivate your account and continue using the system.
            </p>
            
            <div className="space-y-4">
              <Button
                asChild
                className="w-full h-12 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold"
              >
                <a href="mailto:softwarebystorm@gmail.com?subject=POS Subscription Reactivation">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </a>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full h-12"
              >
                <a href="/pos/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </a>
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Need immediate assistance?</strong><br />
                Email: softwarebystorm@gmail.com<br />
                We typically respond within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}