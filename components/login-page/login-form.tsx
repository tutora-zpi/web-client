import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Login into your account to access the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full ">
              Login with Google
            </Button>
            <Button variant="outline" className="w-full">
              Login with Linkedin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
