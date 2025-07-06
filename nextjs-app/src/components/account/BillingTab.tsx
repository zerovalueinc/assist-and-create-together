import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download } from "lucide-react";

const BillingTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You&apos;re currently on the Pro plan with unlimited access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">PersonaOps Pro</h3>
                  <p className="text-sm text-slate-600">Unlimited companies, ICPs, and campaigns</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$99</p>
                  <p className="text-sm text-slate-600">/month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="w-full">Upgrade Plan</Button>
                <Button variant="outline" className="w-full">View All Plans</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Download your previous invoices and payment receipts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "Dec 1, 2024", amount: "$99.00", status: "Paid" },
                { date: "Nov 1, 2024", amount: "$99.00", status: "Paid" },
                { date: "Oct 1, 2024", amount: "$99.00", status: "Paid" },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.date}</p>
                    <p className="text-sm text-slate-600">PersonaOps Pro</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{invoice.amount}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {invoice.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <CreditCard className="h-8 w-8 text-slate-400" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-slate-600">Expires 12/27</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Update Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">API Calls</span>
                <span className="text-sm font-medium">12,450 / ∞</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Companies Analyzed</span>
                <span className="text-sm font-medium">847 / ∞</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Email Campaigns</span>
                <span className="text-sm font-medium">23 / ∞</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingTab;
