import { Tabs } from "@chakra-ui/react";
import { LuAward, LuPackage, LuTags, LuWrench } from "react-icons/lu";
import { Products } from "./Products";
import { Services } from "./Services";
import { Categories } from "./Categories";
import { Brands } from "./Brands";

export const CatalogPage = () => {
  return (
    <Tabs.Root defaultValue="products" lazyMount>
      <Tabs.List>
        <Tabs.Trigger value="products">
          <LuPackage />
          Productos
        </Tabs.Trigger>
        <Tabs.Trigger value="services">
          <LuWrench />
          Servicios
        </Tabs.Trigger>
        <Tabs.Trigger value="categories">
          <LuTags />
          Categorías
        </Tabs.Trigger>
        <Tabs.Trigger value="brands">
          <LuAward />
          Marcas
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="products">
        <Products />
      </Tabs.Content>
      <Tabs.Content value="services">
        <Services />
      </Tabs.Content>
      <Tabs.Content value="categories">
        <Categories />
      </Tabs.Content>
      <Tabs.Content value="brands">
        <Brands />
      </Tabs.Content>
    </Tabs.Root>
  );
};
