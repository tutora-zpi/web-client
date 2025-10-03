import Footer from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow flex flex-col justify-center items-center text-center md:py-2 py-4">
                <h1 className='lg:text-9xl md:text-6xl sm:text-3xl font-bold'>
                    404
                </h1>
                <h2 className='lg:text-6xl md:text-3xl sm:text-xl py-2'>
                    Page Not Found
                </h2>
                <p className='text-primary py-2 text-xl'>
                    The page is out of our vision.
                </p>
                <p className='py-2'>
                    The page you are trying to access was moved or simply does not exists.
                </p>

                <Button asChild variant="outline" size="lg" className="text-xl mt-4">
                    <Link href="/">Go back</Link>
                </Button>
            </div>
            <Footer />
        </div>
    );
}
