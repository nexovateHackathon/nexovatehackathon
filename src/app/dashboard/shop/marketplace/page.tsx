"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mic,
  PackageSearch,
  Search,
  ShoppingCart,
  Square,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "@/contexts/language-context";
import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeSearchQuery } from "@/ai/flows/analyze-search-query";

const productsData = [
  {
    key: "organicPottingMix",
    price: "₹350",
    hint: "bag of organic potting soil",
    image: "/images/organic-potting-mix.jpg",
  },
  {
    key: "bioFertilizer",
    price: "₹500",
    hint: "liquid bio-fertilizer bottle",
    image: "/images/bio-fertilizer.jpg",
  },
  {
    key: "herbSeedsKit",
    price: "₹600",
    hint: "assorted herb seeds pack",
    image: "/images/herb-seeds-kit.jpg",
  },
  {
    key: "balconyPlanters",
    price: "₹1200",
    hint: "set of balcony railing planters",
    image: "/images/balconyPlanters.jpg",
  },
  {
    key: "smartDripKit",
    price: "₹1800",
    hint: "mini drip irrigation kit for pots",
    image: "/images/smartDripKit.jpg",
  },
  {
    key: "compactSoilTestKit",
    price: "₹800",
    hint: "compact soil testing kit",
    image: "/images/compactSoilTestKit.jpg",
  },
  {
    key: "gardeningGloves",
    price: "₹250",
    hint: "protective gardening gloves",
    image: "/images/gardeningGloves.jpg",
  },
  {
    key: "miniSprayer",
    price: "₹950",
    hint: "handheld garden sprayer",
    image: "/images/miniSprayer.jpg",
  },
  {
    key: "growBags",
    price: "₹450",
    hint: "set of fabric grow bags",
    image: "/images/growBags.jpg",
  },
  {
    key: "hydroponicStarterKit",
    price: "₹3500",
    hint: "DIY hydroponic growing kit",
    image: "/images/hydroponicStarterKit.jpg",
  },
  {
    key: "compostBin",
    price: "₹2200",
    hint: "indoor composting bin",
    image: "/images/compostBin.jpg",
  },
  {
    key: "neemOilSpray",
    price: "₹700",
    hint: "ready-to-use neem oil spray",
    image: "/images/neemOilSpray.jpg",
  },
];

const SpeechRecognition =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function MarketplacePage() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCheckingRelevance, setIsCheckingRelevance] = useState(false);
  const [isRelevant, setIsRelevant] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const handleAddToCart = (product: any) => {
    setCart((prevCart) => [...prevCart, product]);
    toast({
      title: `${product.name} added to cart`,
      description: `Price: ${product.price}`,
    });
  };

  const products = useMemo(
    () =>
      productsData.map((product) => ({
        ...product,
        name: t(`${product.key}`),
      })),
    [t]
  );

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  useEffect(() => {
    const checkRelevance = async () => {
      if (searchQuery.trim() === "") {
        setIsRelevant(true);
        return;
      }

      // Only check relevance if there are no local results
      if (filteredProducts.length === 0) {
        setIsCheckingRelevance(true);
        try {
          const result = await analyzeSearchQuery({ query: searchQuery });
          setIsRelevant(result.isRelevant);
        } catch (error) {
          console.error("Relevance check failed", error);
          // Default to relevant to avoid showing the wrong message on API error
          setIsRelevant(true);
        } finally {
          setIsCheckingRelevance(false);
        }
      } else {
        // If there are local results, it's definitely relevant
        setIsRelevant(true);
      }
    };

    const debounceTimer = setTimeout(checkRelevance, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filteredProducts.length]);

  const handleMicClick = () => {
    if (!SpeechRecognition) {
      toast({
        title: t("toast.browserNotSupported"),
        description: t("toast.noVoiceSupport"),
        variant: "destructive",
      });
      return;
    }

    const langMap = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langMap[language] || "en-IN";

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) =>
      setSearchQuery(event.results[0][0].transcript);
    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        toast({
          title: t("toast.noSpeechDetected"),
          description: t("toast.tryAgain"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("toast.voiceError"),
          description: event.error,
          variant: "destructive",
        });
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            {t("shop.marketplace.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("shop.marketplace.description")}
          </p>
        </div>
        <div className="flex gap-2">
          
          <Button asChild variant="outline">
  <Link href="/cart">
    <ShoppingCart className="mr-2 h-4 w-4" />
    Cart ({cart.length})
  </Link>
</Button>

          <Button asChild variant="outline">
            <Link href="/dashboard/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("shop.marketplace.backToStore")}
            </Link>
          </Button>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />{" "}
            {t("shop.marketplace.backToStore")}
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t("learn.searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={handleMicClick}
        >
          {isRecording ? (
            <Square className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          <span className="sr-only">
            {isRecording
              ? t("learn.stopRecording")
              : t("learn.startVoiceSearch")}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0
          ? filteredProducts.map((product, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={product.hint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold">
                    {product.name}
                  </CardTitle>
                  <p className="text-2xl font-bold text-primary mt-2">
                    {product.price}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t("shop.marketplace.addToCart")}
                  </Button>
                </CardFooter>
              </Card>
            ))
          : searchQuery.trim() &&
            !isCheckingRelevance && (
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
                {isRelevant ? (
                  <NoProductsFoundAlert query={searchQuery} />
                ) : (
                  <IrrelevantProductAlert />
                )}
              </div>
            )}
      </div>
    </div>
  );
}

const NoProductsFoundAlert = ({ query }: { query: string }) => {
  const { t } = useTranslation();
  return (
    <Alert>
      <PackageSearch className="h-4 w-4" />
      <AlertTitle>{t("shop.marketplace.comingSoonTitle")}</AlertTitle>
      <AlertDescription>
        {t("shop.marketplace.comingSoonMessage", { query })}
      </AlertDescription>
    </Alert>
  );
};

const IrrelevantProductAlert = () => {
  const { t } = useTranslation();
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("shop.marketplace.irrelevantProductTitle")}</AlertTitle>
      <AlertDescription>
        {t("shop.marketplace.irrelevantProductMessage")}
      </AlertDescription>
    </Alert>
  );
};
