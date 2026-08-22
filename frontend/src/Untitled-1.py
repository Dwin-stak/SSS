n1=float(input("Ingresar primer cateto"))
n2=float(input("Ingresar segundo cateto"))
if n1>0 and n2>0:
    n3=(n1**2+n2**2)**(1/2)
    print(f"La hipotenusa es: {n3}")
else:
    print("ERROR")
