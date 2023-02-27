import random

# ---- Ansible filters ----
class FilterModule(object):
    ''' Generate Random IPv4 address '''

    def filters(self):
        return {
            'generate_ipv4_address': self.generate_ipv4_address
        }

    def generate_ipv4_address(self, seed=1, network=False):
        random.seed(seed)

        ip = ""
        network_bits = "24"

        if network:
            ip = ".".join(map(str, (random.randint(0, 255) for _ in range(3))))
            ip += ".0/{}".format(str(network_bits))
        else:
            ip = ".".join(map(str, (random.randint(0, 255) for _ in range(4))))
        
        return ip 
