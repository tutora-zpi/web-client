import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

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
            <Button asChild variant="secondary">
              <Link
                href={`${process.env.NEXT_PUBLIC_USER_SERVICE}/oauth2/authorization/google`}
              >
                Google
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
