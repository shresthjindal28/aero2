import Header from "@/components/Header";
import { ModeToggle } from "@/components/Theme-toogle-button"; 

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Header content={"Settings"} className="text-3xl font-bold mb-8" />

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="theme-mode" className="flex flex-col space-y-1">
                <span>Theme</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Select your preferred light or dark mode.
                </span>
              </Label>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="marketing-emails"
                className="flex flex-col space-y-1"
              >
                <span>Marketing Emails</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Receive emails about new products and features.
                </span>
              </Label>
              <Switch id="marketing-emails" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="activity-updates"
                className="flex flex-col space-y-1"
              >
                <span>Activity Updates</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Get notified about activity on your account.
                </span>
              </Label>
              <Switch id="activity-updates" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex flex-col">
              <strong>Delete Account</strong>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
