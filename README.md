# This is a e-commerce-backend server application, handling the request related to e-commerce APIs.
## this application is made using nodejs, expressjs and PostgreSql


### clone this repo to use this api.
After cloning:
  setup project by typing "npm install" in terminal.

### Use the following queries to create tables in PostgreSQL:

After running these commands, you can go to "http://localhost:3001/api-docs" to use the APIs using Swagger UI.



CREATE TABLE public.users
(
    email_id character varying(100) COLLATE pg_catalog."default" NOT NULL,
    pass character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone integer,
    name character varying(100) COLLATE pg_catalog."default",
    user_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (user_name)
)
TABLESPACE pg_default;
    
  
CREATE TABLE public.categories
(
    category_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    category_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (category_name),
    CONSTRAINT "unique" UNIQUE (category_id)
        INCLUDE(category_id)
)
TABLESPACE pg_default;


CREATE TABLE public.products
(
    product_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description character varying(250) COLLATE pg_catalog."default",
    price double precision NOT NULL,
    category_id integer,
    quantity integer NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (product_id),
    CONSTRAINT fk_prod_categ_id FOREIGN KEY (category_id)
        REFERENCES public.categories (category_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
TABLESPACE pg_default;


CREATE TABLE public.cart_items
(
    cart_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT cart_items_pkey PRIMARY KEY (cart_id),
    CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES public.products (product_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT cart_items_user_name_fkey FOREIGN KEY (user_name)
        REFERENCES public.users (user_name) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;


CREATE TABLE public.order_summary
(
    order_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    order_timing timestamp without time zone,
    CONSTRAINT order_summary_pkey PRIMARY KEY (order_id),
    CONSTRAINT order_summary_user_name_fkey FOREIGN KEY (user_name)
        REFERENCES public.users (user_name) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;


CREATE TABLE public.order_details
(
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    CONSTRAINT "fk_orderDetails_OrderSummary_id" FOREIGN KEY (order_id)
        REFERENCES public.order_summary (order_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT order_details_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES public.products (product_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;
