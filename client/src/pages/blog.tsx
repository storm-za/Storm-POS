import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight, Calendar, User } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { updatePageSEO } from "@/lib/seo";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  author: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "why-south-african-retailers-switching-cloud-pos",
    title: "Why South African Retailers Are Switching to Cloud POS in 2025",
    excerpt: "Load shedding, rising costs, and changing consumer habits are forcing SA retailers to rethink their point of sale systems. Here's why cloud-based solutions are winning.",
    readTime: "8 min read",
    date: "December 15, 2025",
    author: "Storm Team",
    category: "POS Systems",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop"
  },
  {
    slug: "real-cost-not-having-website-2025",
    title: "The Real Cost of Not Having a Website in 2025",
    excerpt: "With 3 million small businesses in South Africa, standing out is harder than ever. We break down exactly what you're losing without an online presence.",
    readTime: "6 min read",
    date: "December 12, 2025",
    author: "Storm Team",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop"
  },
  {
    slug: "how-choose-right-pos-system-business",
    title: "How to Choose the Right POS System for Your Business",
    excerpt: "From offline capabilities to payment integrations—a no-nonsense guide to selecting a POS system that actually works for South African businesses.",
    readTime: "10 min read",
    date: "December 8, 2025",
    author: "Storm Team",
    category: "POS Systems",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=400&fit=crop"
  }
];

export default function Blog() {
  useEffect(() => {
    updatePageSEO({
      title: 'Blog - Storm Software | Tech Insights for SA Businesses',
      description: 'Expert insights on POS systems, web development, and digital transformation for South African businesses. Stay ahead with Storm Software.',
      canonical: window.location.origin + '/blog'
    });
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-[hsl(217,90%,40%)]/10 text-[hsl(217,90%,40%)] rounded-full text-sm font-medium mb-4">
              Storm Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Insights for <span className="text-[hsl(217,90%,40%)]">Growing Businesses</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practical tech advice, industry trends, and expert guides to help your South African business thrive in the digital age.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card 
                    className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/80 backdrop-blur-sm"
                    data-testid={`blog-card-${post.slug}`}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[hsl(217,90%,40%)] text-white text-xs font-medium rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[hsl(217,90%,40%)] transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1 text-[hsl(217,90%,40%)] font-medium text-sm group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-20 text-center"
            {...fadeInUp}
          >
            <div className="inline-block p-8 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 to-[hsl(217,90%,50%)]/10 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Transform Your Business?
              </h3>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                Whether you need a stunning website or a powerful POS system, Storm has you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/web-development">
                  <button 
                    className="px-6 py-3 bg-[hsl(217,90%,40%)] text-white rounded-lg font-medium hover:bg-[hsl(217,90%,35%)] transition-colors"
                    data-testid="cta-web-development"
                  >
                    Explore Web Development
                  </button>
                </Link>
                <Link href="/pos">
                  <button 
                    className="px-6 py-3 border-2 border-[hsl(217,90%,40%)] text-[hsl(217,90%,40%)] rounded-lg font-medium hover:bg-[hsl(217,90%,40%)] hover:text-white transition-colors"
                    data-testid="cta-pos-system"
                  >
                    Discover Storm POS
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
