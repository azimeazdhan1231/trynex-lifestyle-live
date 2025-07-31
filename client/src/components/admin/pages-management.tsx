import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileText, Eye, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Page } from "@shared/schema";

const pageSchema = z.object({
  slug: z.string().min(1, "স্লাগ প্রয়োজন").regex(/^[a-z0-9-]+$/, "শুধুমাত্র ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন ব্যবহার করুন"),
  title: z.string().min(1, "শিরোনাম প্রয়োজন"),
  content: z.string().min(1, "কন্টেন্ট প্রয়োজন"),
  is_active: z.boolean(),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageFormProps {
  page?: Page;
  onClose: () => void;
}

function PageForm({ page, onClose }: PageFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      slug: page?.slug || "",
      title: page?.title || "",
      content: page?.content || "",
      is_active: page?.is_active ?? true,
    },
  });

  const createPageMutation = useMutation({
    mutationFn: (data: PageFormData) => apiRequest('/api/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      onClose();
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: (data: PageFormData) => apiRequest(`/api/pages/${page?.slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      onClose();
    },
  });

  const onSubmit = (data: PageFormData) => {
    if (page) {
      updatePageMutation.mutate(data);
    } else {
      createPageMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>স্লাগ (URL) *</FormLabel>
                <FormControl>
                  <Input placeholder="terms-conditions" {...field} disabled={!!page} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {!!page ? "স্লাগ পরিবর্তন করা যাবে না" : "URL-এ ব্যবহৃত হবে। যেমন: terms-conditions"}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>পেজের শিরোনাম *</FormLabel>
                <FormControl>
                  <Input placeholder="শর্তাবলী" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>পেজ কন্টেন্ট *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="পেজের বিস্তারিত কন্টেন্ট লিখুন। HTML ট্যাগ ব্যবহার করা যাবে।"
                  className="min-h-[300px]"
                  {...field} 
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                HTML ট্যাগ সাপোর্ট করে। যেমন: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; ইত্যাদি।
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">সক্রিয় পেজ</FormLabel>
                <p className="text-sm text-muted-foreground">
                  পেজটি ওয়েবসাইটে দেখানো হবে কি না
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            বাতিল
          </Button>
          <Button 
            type="submit" 
            disabled={createPageMutation.isPending || updatePageMutation.isPending}
          >
            {page ? "আপডেট করুন" : "তৈরি করুন"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function PagesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | undefined>();
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["/api/pages"],
  });

  const deletePageMutation = useMutation({
    mutationFn: (slug: string) => apiRequest(`/api/pages/${slug}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
    },
  });

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setIsDialogOpen(true);
  };

  const handleDelete = (slug: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই পেজ মুছে ফেলতে চান?')) {
      deletePageMutation.mutate(slug);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPage(undefined);
  };

  const defaultPages = [
    {
      slug: 'terms-conditions',
      title: 'শর্তাবলী',
      content: `<h2>শর্তাবলী</h2>
<p>Trynex Lifestyle এর ওয়েবসাইট ব্যবহারের জন্য নিম্নলিখিত শর্তাবলী প্রযোজ্য:</p>

<h3>১. সাধারণ শর্তাবলী</h3>
<ul>
<li>আমাদের ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন।</li>
<li>আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি।</li>
<li>পরিবর্তিত শর্তাবলী ওয়েবসাইটে প্রকাশের সাথে সাথে কার্যকর হবে।</li>
</ul>

<h3>২. অর্ডার ও পেমেন্ট</h3>
<ul>
<li>সকল অর্ডার আমাদের নিশ্চিতকরণের পর চূড়ান্ত হবে।</li>
<li>আমরা ক্যাশ অন ডেলিভারি এবং অ্যাডভান্স পেমেন্ট গ্রহণ করি।</li>
<li>অ্যাডভান্স পেমেন্টের ক্ষেত্রে bKash/Nagad: 01747292277 ব্যবহার করুন।</li>
</ul>

<h3>৩. ডেলিভারি</h3>
<ul>
<li>ঢাকার ভিতরে ২৪-৪৮ ঘন্টা।</li>
<li>ঢাকার বাইরে ৪৮-৭২ ঘন্টা।</li>
<li>ডেলিভারি চার্জ ঢাকার ভিতরে ৮০ টাকা, বাইরে ৮০-১২০ টাকা।</li>
</ul>

<h3>৪. রিটার্ন ও রিফান্ড</h3>
<ul>
<li>৭ দিনের মধ্যে রিটার্ন সুবিধা।</li>
<li>পণ্য অবশ্যই অব্যবহৃত ও মূল প্যাকেজিং সহ থাকতে হবে।</li>
<li>কাস্টমাইজড পণ্য রিটার্ন যোগ্য নয়।</li>
</ul>

<h3>৫. গোপনীয়তা</h3>
<ul>
<li>আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করি।</li>
<li>তৃতীয় পক্ষের সাথে তথ্য শেয়ার করি না।</li>
</ul>

<p><strong>যোগাযোগ:</strong> কোনো প্রশ্ন থাকলে +880 1747 292 277 নম্বরে যোগাযোগ করুন।</p>`
    },
    {
      slug: 'refund-policy',
      title: 'রিফান্ড পলিসি',
      content: `<h2>রিফান্ড পলিসি</h2>
<p>Trynex Lifestyle গ্রাহক সন্তুষ্টিকে সর্বোচ্চ অগ্রাধিকার দেয়। আমাদের রিফান্ড পলিসি নিম্নরূপ:</p>

<h3>১. রিফান্ডের শর্তাবলী</h3>
<ul>
<li>পণ্য ডেলিভারির ৭ দিনের মধ্যে রিটার্ন করতে হবে।</li>
<li>পণ্য অবশ্যই অব্যবহৃত ও মূল অবস্থায় থাকতে হবে।</li>
<li>মূল প্যাকেজিং, ট্যাগ ও লেবেল অক্ষত থাকতে হবে।</li>
<li>কাস্টমাইজড পণ্য রিটার্ন গ্রহণযোগ্য নয়।</li>
</ul>

<h3>২. রিফান্ড প্রক্রিয়া</h3>
<ul>
<li>হোয়াটসঅ্যাপে +880 1747 292 277 নম্বরে যোগাযোগ করুন।</li>
<li>অর্ডার নম্বর ও রিটার্নের কারণ জানান।</li>
<li>আমাদের টিম ২৪ ঘন্টার মধ্যে আপনার অনুরোধ পর্যালোচনা করবে।</li>
<li>অনুমোদনের পর পণ্য পিকআপের ব্যবস্থা করা হবে।</li>
</ul>

<h3>৩. রিফান্ডের সময়সীমা</h3>
<ul>
<li>পণ্য গ্রহণের ৩-৫ কার্যদিবসের মধ্যে রিফান্ড প্রক্রিয়া সম্পন্ন হবে।</li>
<li>ব্যাংক বা মোবাইল ব্যাংকিং এর মাধ্যমে রিফান্ড করা হবে।</li>
<li>ক্যাশ অন ডেলিভারির ক্ষেত্রে সরাসরি ক্যাশ রিফান্ড।</li>
</ul>

<h3>৪. যে ক্ষেত্রে রিফান্ড প্রযোজ্য নয়</h3>
<ul>
<li>গ্রাহকের ব্যবহারজনিত ক্ষতি।</li>
<li>প্রাকৃতিক পরিবর্তন (রং, গন্ধ)।</li>
<li>৭ দিনের পর রিটার্ন অনুরোধ।</li>
<li>কাস্টমাইজড বা পার্সোনালাইজড পণ্য।</li>
</ul>

<h3>৫. এক্সচেঞ্জ পলিসি</h3>
<ul>
<li>সাইজ বা রং পরিবর্তনের জন্য এক্সচেঞ্জ সুবিধা।</li>
<li>এক্সচেঞ্জের জন্য অতিরিক্ত চার্জ প্রযোজ্য হতে পারে।</li>
<li>স্টক থাকা সাপেক্ষে এক্সচেঞ্জ করা হবে।</li>
</ul>

<h3>৬. ক্ষতিগ্রস্ত পণ্য</h3>
<ul>
<li>ডেলিভারির সময় ক্ষতিগ্রস্ত পণ্য তাৎক্ষণিক পরিবর্তন।</li>
<li>ছবি ও ভিডিও প্রমাণ প্রয়োজন।</li>
<li>সম্পূর্ণ দায়িত্ব আমাদের।</li>
</ul>

<p><strong>যোগাযোগ:</strong> রিফান্ড সংক্রান্ত যেকোনো প্রশ্নের জন্য +880 1747 292 277 নম্বরে হোয়াটসঅ্যাপ করুন।</p>

<p><em>এই নীতি যেকোনো সময় পরিবর্তন হতে পারে। সর্বশেষ আপডেটের জন্য নিয়মিত চেক করুন।</em></p>`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">পেজ ম্যানেজমেন্ট</h2>
          <p className="text-muted-foreground">
            ওয়েবসাইটের স্ট্যাটিক পেজগুলো পরিচালনা করুন
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPage(undefined)}>
                <Plus className="w-4 h-4 mr-2" />
                নতুন পেজ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? "পেজ সম্পাদনা" : "নতুন পেজ তৈরি"}
                </DialogTitle>
              </DialogHeader>
              <PageForm page={editingPage} onClose={handleCloseDialog} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Default Pages Setup */}
      {pages.length === 0 && !isLoading && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">প্রয়োজনীয় পেজ সেটআপ করুন</h3>
            <p className="text-muted-foreground mb-6">
              শর্তাবলী ও রিফান্ড পলিসি পেজ তৈরি করুন
            </p>
            <div className="flex justify-center space-x-2">
              {defaultPages.map((defaultPage) => (
                <Button
                  key={defaultPage.slug}
                  variant="outline"
                  onClick={() => {
                    createPageMutation.mutate(defaultPage as any);
                  }}
                >
                  {defaultPage.title} তৈরি করুন
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page: Page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        /{page.slug}
                      </code>
                    </div>
                    {page.is_active ? (
                      <Badge className="text-xs bg-green-500">সক্রিয়</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">নিষ্ক্রিয়</Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg">
                    {page.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {page.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>আপডেট: {format(new Date(page.updated_at), 'dd/MM/yy')}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(page)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      সম্পাদনা
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/${page.slug}`, '_blank')}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      দেখুন
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(page.slug)}
                      disabled={deletePageMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}