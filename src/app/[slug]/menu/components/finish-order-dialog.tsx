"use client";

import { Button } from "@/components/ui/button";
import { z } from "zod";
import { PatternFormat } from "react-number-format";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import { isValidCpf } from "../helpers/cpf";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ConsumptionMethod } from "@prisma/client";
import { createOrder } from "../actions/create-order";
import { useParams, useSearchParams } from "next/navigation";
import { useContext, useTransition } from "react";
import { CartContext } from "../contexts/cart";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";



type FormSchema = z.infer<typeof formSchema>;

  const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
    cpf: z.string().trim().min(1, { message: "CPF é obrigatório" }).refine((value) => isValidCpf(value), { message: "CPF inválido" }),
  })

  interface FinishOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
const FinishOrderDialog = ({ open, onOpenChange }: FinishOrderDialogProps) => {
  const { products } = useContext(CartContext);
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { slug } = useParams<{ slug: string }>();
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            cpf: "",
        },
    shouldUnregister: true,    

    })
    const onSubmit = async (data: FormSchema) => {
        try {
          const consumptionMethod = searchParams.get("consumptionMethod") as ConsumptionMethod;
          startTransition(async () => {
            await createOrder({
              consumptionMethod,
              customerCpf: data.cpf,
              customerName: data.name,
              products,
              slug,
            });
            onOpenChange(false);
        toast.success("Pedido finalizado com sucesso");
          });
        } catch (error) {
          console.error(error);}
    }
    return (
    <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerTrigger asChild>
    </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Finalizar pedido</DrawerTitle>
      <DrawerDescription>Insira suas informações abaixo para finalizar o pedido.</DrawerDescription>
    </DrawerHeader>
    <div className="p-5">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu nome..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <PatternFormat placeholder="Digite seu CPF..." format="###.###.###-##" customInput={Input} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DrawerFooter>
      <Button type="submit" className="rounded-full" variant="destructive" disabled={isPending}>{isPending ? <Loader2Icon className="animate-spin" 
      /> : "Finalizar pedido"}</Button>
      <DrawerClose asChild>
        <Button variant="secondary" className="rounded-full w-full">Cancelar</Button>
      </DrawerClose>
    </DrawerFooter>
      </form>
    </Form>
    </div>  
  </DrawerContent>
</Drawer>
    )
}

export default FinishOrderDialog;